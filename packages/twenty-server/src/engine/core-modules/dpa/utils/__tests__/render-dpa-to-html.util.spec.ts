import { DpaRegion } from 'src/engine/core-modules/dpa/enums/dpa-region.enum';
import {
  type DpaResolveContext,
  type ResolvedDpa,
} from 'src/engine/core-modules/dpa/types/dpa.types';
import { resolveDpa } from 'src/engine/core-modules/dpa/utils/resolve-dpa.util';
import { renderDpaToHtml } from 'src/engine/core-modules/dpa/utils/render-dpa-to-html.util';

// A synthetic resolved document used to test the conditional-clause MECHANISM in
// isolation (the real template intentionally branches no clauses).
const buildResolvedWithConditionalBlock = (
  sccSectionActive: boolean,
): ResolvedDpa => ({
  region: sccSectionActive ? DpaRegion.US : DpaRegion.EU,
  templateVersion: 'test',
  lastUpdatedLabel: 'June 2026',
  title: 'Test DPA',
  sccSectionActive,
  values: {
    PROCESSOR_ENTITY: 'Twenty.com SAS',
    PROCESSOR_LEGAL_FORM: 'x',
    PROCESSOR_ADDRESS: 'x',
    HOSTING_REGION: 'x',
    GOVERNING_LAW: 'x',
    DPO_NAME_AND_CONTACT: 'x',
  },
  blocks: [
    { kind: 'heading', text: 'Always Present' },
    ...(sccSectionActive
      ? [{ kind: 'paragraph' as const, text: 'CONDITIONAL_SCC_ONLY_BLOCK' }]
      : []),
  ],
});

describe('renderDpaToHtml', () => {
  const baseContext: DpaResolveContext = {
    region: DpaRegion.EU,
    mode: 'preview',
  };

  it('renders the title and last-updated line', () => {
    const html = renderDpaToHtml(resolveDpa(baseContext));

    expect(html).toContain('Twenty Data Processing Agreement (DPA)');
    expect(html).toContain('Last Updated: June 2026');
  });

  it('contains no unresolved {{ }} merge fields in the output', () => {
    for (const region of [DpaRegion.EU, DpaRegion.US]) {
      const html = renderDpaToHtml(resolveDpa({ region, mode: 'signed' }));

      expect(html).not.toMatch(/\{\{[^}]+\}\}/);
    }
  });

  it('toggles conditional clauses correctly via the includeWhen mechanism', () => {
    const dormant = renderDpaToHtml(buildResolvedWithConditionalBlock(false));
    const active = renderDpaToHtml(buildResolvedWithConditionalBlock(true));

    expect(dormant).not.toContain('CONDITIONAL_SCC_ONLY_BLOCK');
    expect(active).toContain('CONDITIONAL_SCC_ONLY_BLOCK');
    // The always-present block stays in both.
    expect(dormant).toContain('Always Present');
    expect(active).toContain('Always Present');
  });

  it('escapes HTML in legal text to prevent injection', () => {
    const resolved: ResolvedDpa = {
      ...buildResolvedWithConditionalBlock(false),
      blocks: [{ kind: 'paragraph', text: '<script>alert(1)</script>' }],
    };

    const html = renderDpaToHtml(resolved);

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('renders the executed signatory and Processor entity in signed mode', () => {
    const html = renderDpaToHtml(
      resolveDpa({
        region: DpaRegion.EU,
        mode: 'signed',
        customerLegalEntityName: 'Acme GmbH',
        signatory: { name: 'Jane Doe', title: 'CEO' },
        executedAt: '2026-06-26T00:00:00.000Z',
      }),
    );

    expect(html).toContain('Acme GmbH');
    expect(html).toContain('Jane Doe');
    expect(html).toContain('Twenty.com SAS');
  });

  it('renders a clean cloud DPA: no merge tokens, drafting notes, placeholders, or self-hosted banner', () => {
    const html = renderDpaToHtml(
      resolveDpa({
        region: DpaRegion.EU,
        mode: 'signed',
        customerLegalEntityName: 'Acme GmbH',
        signatory: { name: 'Jane Doe', title: 'Head of Legal' },
        executedAt: '2026-06-27T00:00:00.000Z',
        isSelfHosted: false,
      }),
    );

    for (const forbidden of [
      '{{',
      '(default:',
      'for US deployments',
      'the the',
      'NOT A VALID AGREEMENT',
      'LEGAL ENTITY',
      'SIGNATORY NAME',
    ]) {
      expect(html).not.toContain(forbidden);
    }

    expect(html).toContain('Stéphanie Joly');
    expect(
      html.match(/7\.1 Data Hosting and Localization:/g) ?? [],
    ).toHaveLength(1);
  });

  it('shows the self-hosted banner for a self-hosted deployment but not for cloud', () => {
    const selfHosted = renderDpaToHtml(
      resolveDpa({ region: DpaRegion.EU, mode: 'preview', isSelfHosted: true }),
    );
    const cloud = renderDpaToHtml(
      resolveDpa({
        region: DpaRegion.EU,
        mode: 'preview',
        isSelfHosted: false,
      }),
    );

    expect(selfHosted).toContain('NOT A VALID AGREEMENT');
    expect(cloud).not.toContain('NOT A VALID AGREEMENT');
  });
});
