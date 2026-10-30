import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import { type SetuAiResearchBrief } from 'twenty-shared/ai';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { IconExternalLink } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { LazyMarkdownContent } from '@/ai/components/LazyMarkdownRenderer';

const StyledBrief = styled.div`
  border-left: 2px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[3]};
`;

const StyledHeading = styled.h4`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledReferences = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledList = styled.ul`
  margin: 0;
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledSourceList = styled.ol`
  margin: 0;
  overflow-wrap: anywhere;
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledExternalLink = styled.a`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: inline-flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledScope = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-style: italic;
  margin: 0;
`;

type AiResearchBriefViewProps = {
  brief: SetuAiResearchBrief;
};

// Every source shown here was retrieved by the research run itself; the
// server dropped any reference it could not resolve.
export const AiResearchBriefView = ({ brief }: AiResearchBriefViewProps) => {
  const { t } = useLingui();
  const evidenceNumberById = new Map(
    brief.evidence.map((evidence, index) => [evidence.id, index + 1]),
  );

  return (
    <StyledBrief>
      <LazyMarkdownContent text={brief.summary} />
      {brief.sections.map((section) => (
        <div key={section.heading}>
          <StyledHeading>{section.heading}</StyledHeading>
          <LazyMarkdownContent text={section.body} />
          {section.evidenceIds.length > 0 && (
            <StyledReferences>
              {t`Sources:`}{' '}
              {section.evidenceIds
                .map((evidenceId) => evidenceNumberById.get(evidenceId))
                .filter((number) => number !== undefined)
                .map((number) => `[${number}]`)
                .join(' ')}
            </StyledReferences>
          )}
        </div>
      ))}
      {brief.unknowns.length > 0 && (
        <div>
          <StyledHeading>{t`Unknowns`}</StyledHeading>
          <StyledList>
            {brief.unknowns.map((unknown) => (
              <li key={unknown}>{unknown}</li>
            ))}
          </StyledList>
        </div>
      )}
      {brief.suggestedNextSteps.length > 0 && (
        <div>
          <StyledHeading>{t`Suggested next steps`}</StyledHeading>
          <StyledList>
            {brief.suggestedNextSteps.map((nextStep) => (
              <li key={nextStep}>{nextStep}</li>
            ))}
          </StyledList>
        </div>
      )}
      {brief.evidence.length > 0 && (
        <div>
          <StyledHeading>{t`Sources`}</StyledHeading>
          <StyledSourceList>
            {brief.evidence.map((evidence) => (
              <li key={evidence.id}>
                {evidence.kind === 'web' ? (
                  <StyledExternalLink
                    href={evidence.url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {evidence.label}
                    <IconExternalLink size={12} />
                  </StyledExternalLink>
                ) : (
                  <Link
                    to={getAppPath(AppPath.RecordShowPage, {
                      objectNameSingular: evidence.objectNameSingular,
                      objectRecordId: evidence.recordId,
                    })}
                  >
                    {evidence.label}
                  </Link>
                )}
              </li>
            ))}
          </StyledSourceList>
        </div>
      )}
      <StyledScope>
        {brief.scope === 'crm_only'
          ? t`Scope: CRM records only. No web sources were used.`
          : t`Scope: CRM records and cited web pages.`}
        {brief.removedEvidenceCount > 0 &&
          ` ${t`${brief.removedEvidenceCount} unsupported reference(s) were removed.`}`}
      </StyledScope>
    </StyledBrief>
  );
};
