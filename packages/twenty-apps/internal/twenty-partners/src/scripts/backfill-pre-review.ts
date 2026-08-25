// One-off backfill of preReviewVerdict + dossier notes over the existing
// APPLICATION backlog. Reuses the same evidence-pack and agent path as the
// partner.created trigger, run locally against the prod API.
//
//   yarn backfill:pre-review:prod --tally=./tally-answers.json --limit=10 --dry-run
//   yarn backfill:pre-review:prod --tally=./tally-answers.json
//
import { readFileSync } from 'node:fs';

import { config } from 'dotenv';
config({ path: process.env.ENV_FILE ?? '.env.local' });

import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import { runAgent } from 'twenty-sdk/logic-function';

import { PARTNER_PRE_REVIEW_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createPreReviewNote } from 'src/modules/partner/pre-review/graphql/mutations/create-pre-review-note';
import { updatePartnerPreReviewVerdict } from 'src/modules/partner/pre-review/graphql/mutations/update-partner-pre-review-verdict';
import { buildEvidencePack } from 'src/modules/partner/pre-review/mappers/build-evidence-pack.mapper';
import { buildPreReviewNote } from 'src/modules/partner/pre-review/mappers/build-pre-review-note.mapper';
import { collectPreReviewSources } from 'src/modules/partner/pre-review/services/collect-pre-review-sources.service';
import { type PartnerForPreReview } from 'src/modules/partner/pre-review/types/pre-review.type';
import { applyVerdictCap } from 'src/modules/partner/pre-review/utils/apply-verdict-cap.util';
import { parsePreReviewAgentResult } from 'src/modules/partner/pre-review/utils/parse-pre-review-agent-result.util';
import { collectAll } from 'src/modules/shared/utils/paginate.util';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

export type TallyAnswer = {
  partnerId?: string;
  email?: string;
  proofUrl?: string;
  notes?: string;
};

export type BackfillPartner = { id: string; email: string | null };

export const joinTallyAnswers = ({
  partners,
  tallyAnswers,
}: {
  partners: BackfillPartner[];
  tallyAnswers: TallyAnswer[];
}): { matched: Map<string, TallyAnswer>; orphans: TallyAnswer[] } => {
  const partnerIds = new Set(partners.map((partner) => partner.id));
  const partnerIdByEmail = new Map(
    partners
      .filter((partner) => isNonEmptyString(partner.email))
      .map((partner) => [
        (partner.email as string).trim().toLowerCase(),
        partner.id,
      ]),
  );

  const matched = new Map<string, TallyAnswer>();
  const orphans: TallyAnswer[] = [];

  for (const answer of tallyAnswers) {
    const byId =
      isNonEmptyString(answer.partnerId) && partnerIds.has(answer.partnerId)
        ? answer.partnerId
        : undefined;
    const byEmail = isNonEmptyString(answer.email)
      ? partnerIdByEmail.get(answer.email.trim().toLowerCase())
      : undefined;
    const partnerId = byId ?? byEmail;

    if (partnerId === undefined) {
      orphans.push(answer);
      continue;
    }

    if (!matched.has(partnerId)) matched.set(partnerId, answer);
  }

  return { matched, orphans };
};

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} env var`);

  return value;
};

const readFlag = (name: string): string | undefined =>
  process.argv
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');

const hasFlag = (name: string): boolean =>
  process.argv.includes(`--${name}`);

type BacklogNode = {
  id: string;
  name: string | null;
  city: string | null;
  country: string | null;
  typeOfTeam: string | null;
  partnerScope: string[] | null;
  skills: string[] | null;
  twentyExperience: string[] | null;
  twentyExperienceNotes: string | null;
  applicationNotes: string | null;
  preReviewVerdict: string | null;
  hourlyRate: { amountMicros: number } | null;
  projectBudgetMin: { amountMicros: number } | null;
  website: { primaryLinkUrl: string } | null;
  linkedin: { primaryLinkUrl: string } | null;
  twentyExperienceProofLink: { primaryLinkUrl: string } | null;
  persons: { edges: { node: { emails: { primaryEmail: string } | null } }[] };
};

const fetchBacklog = (client: CoreApiClient): Promise<BacklogNode[]> =>
  collectAll<BacklogNode>(async (after) => {
    const page = await client.query({
      partners: {
        __args: {
          filter: {
            validationStage: { eq: 'APPLICATION' },
            preReviewVerdict: { is: 'NULL' },
          },
          first: 30,
          ...(after === undefined ? {} : { after }),
        },
        edges: {
          node: {
            id: true,
            name: true,
            city: true,
            country: true,
            typeOfTeam: true,
            partnerScope: true,
            skills: true,
            twentyExperience: true,
            twentyExperienceNotes: true,
            applicationNotes: true,
            preReviewVerdict: true,
            hourlyRate: { amountMicros: true },
            projectBudgetMin: { amountMicros: true },
            website: { primaryLinkUrl: true },
            linkedin: { primaryLinkUrl: true },
            twentyExperienceProofLink: { primaryLinkUrl: true },
            persons: {
              edges: { node: { emails: { primaryEmail: true } } },
            },
          },
        },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    } as never);

    return (page as { partners: unknown }).partners as never;
  });

const primaryEmailOf = (node: BacklogNode): string | null =>
  node.persons?.edges?.[0]?.node?.emails?.primaryEmail ?? null;

const toPartnerForPreReview = (
  node: BacklogNode,
  tallyAnswer: TallyAnswer | undefined,
): PartnerForPreReview => ({
  id: node.id,
  name: node.name,
  city: node.city,
  country: node.country,
  typeOfTeam: node.typeOfTeam,
  partnerScope: node.partnerScope,
  skills: node.skills,
  twentyExperience: node.twentyExperience,
  twentyExperienceNotes: [node.twentyExperienceNotes, tallyAnswer?.notes]
    .filter(isNonEmptyString)
    .join('\n\n') || null,
  applicationNotes: node.applicationNotes,
  hourlyRateAmountMicros: node.hourlyRate?.amountMicros ?? null,
  projectBudgetMinAmountMicros: node.projectBudgetMin?.amountMicros ?? null,
  websiteUrl: node.website?.primaryLinkUrl ?? null,
  linkedinUrl: node.linkedin?.primaryLinkUrl ?? null,
  proofUrl:
    node.twentyExperienceProofLink?.primaryLinkUrl ??
    tallyAnswer?.proofUrl ??
    null,
});

async function main() {
  const apiUrl = requireEnv('TWENTY_PARTNERS_API_URL').replace(/\/$/, '');
  const apiKey = requireEnv('TWENTY_PARTNERS_API_KEY');

  // runAgent reads these at call time; outside the Lambda nothing injects them.
  process.env.TWENTY_API_URL = apiUrl;
  process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = apiKey;
  process.env.TWENTY_APP_ACCESS_TOKEN = apiKey;

  const isDryRun = hasFlag('dry-run');
  const limitFlag = readFlag('limit');
  const limit = limitFlag === undefined ? Infinity : Number(limitFlag);
  const tallyPath = readFlag('tally');

  const tallyAnswers: TallyAnswer[] =
    tallyPath === undefined
      ? []
      : (JSON.parse(readFileSync(tallyPath, 'utf8')) as TallyAnswer[]);

  const client = new CoreApiClient({
    url: `${apiUrl}/graphql`,
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const backlog = await fetchBacklog(client);
  const { matched, orphans } = joinTallyAnswers({
    partners: backlog.map((node) => ({
      id: node.id,
      email: primaryEmailOf(node),
    })),
    tallyAnswers,
  });

  console.log(
    `[backfill] target ${apiUrl} — ${backlog.length} ungraded APPLICATION partners, ${tallyAnswers.length} Tally rows, ${orphans.length} orphan rows`,
  );
  for (const orphan of orphans) {
    console.warn(
      `[backfill] orphan Tally row (no matching partner): ${JSON.stringify(orphan)}`,
    );
  }

  let graded = 0;

  for (const node of backlog) {
    if (graded >= limit) break;

    const partner = toPartnerForPreReview(node, matched.get(node.id));

    if (
      partner.proofUrl === null &&
      partner.websiteUrl === null &&
      partner.linkedinUrl === null
    ) {
      console.log(`[backfill] skip ${node.id} (${node.name}) — no link at all`);
      continue;
    }

    try {
      const sources = await collectPreReviewSources(partner);
      const evidencePack = buildEvidencePack({ partner, sources });

      const agentResult = await runAgent({
        agentUniversalIdentifier: PARTNER_PRE_REVIEW_AGENT_UNIVERSAL_IDENTIFIER,
        prompt: evidencePack.text,
      });

      const agentOutput = agentResult.success
        ? parsePreReviewAgentResult(agentResult.result)
        : null;

      if (agentOutput === null) {
        console.error(
          `[backfill] ${node.id} (${node.name}) — agent returned nothing usable, skipped`,
        );
        continue;
      }

      const verdict = applyVerdictCap({
        verdict: agentOutput.verdict,
        hasVerifiableProof: evidencePack.hasVerifiableProof,
      });
      const { title, markdown } = buildPreReviewNote({
        verdict,
        agentOutput,
        evidencePack,
      });

      graded += 1;

      if (isDryRun) {
        console.log(
          `[backfill] DRY RUN ${node.id} (${node.name}) → ${verdict}\n${markdown}\n`,
        );
        continue;
      }

      await createPreReviewNote(client, {
        partnerId: node.id,
        title,
        markdown,
      });
      await updatePartnerPreReviewVerdict(
        client,
        node.id,
        verdict as CoreSchema.PartnerUpdateInput['preReviewVerdict'],
      );

      console.log(`[backfill] ${node.id} (${node.name}) → ${verdict}`);
    } catch (error) {
      console.error(`[backfill] ${node.id} (${node.name}) failed:`, error);
    }
  }

  console.log(`[backfill] done — ${graded} graded${isDryRun ? ' (dry run)' : ''}`);
}

// The unit test imports this module for joinTallyAnswers; without the guard the
// import would run the whole backfill against whatever .env.local points at.
if (process.env.VITEST === undefined) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
