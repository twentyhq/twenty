import {
  DEFAULT_DPA_REGION,
  DPA_REGION_CONFIGS,
} from 'src/engine/core-modules/dpa/config/dpa-region-config.constant';
import { DPA_TEMPLATE_VERSION } from 'src/engine/core-modules/dpa/constants/dpa-template-version.constant';
import { DpaRegion } from 'src/engine/core-modules/dpa/enums/dpa-region.enum';
import {
  findUnresolvedMergeFields,
  resolveDpa,
} from 'src/engine/core-modules/dpa/utils/resolve-dpa.util';

describe('resolveDpa', () => {
  it('defaults to EU and resolves the EU Processor entity, law and dormant SCC state', () => {
    const resolved = resolveDpa({
      region: DEFAULT_DPA_REGION,
      mode: 'preview',
    });

    expect(resolved.region).toBe('EU');
    expect(resolved.values.PROCESSOR_ENTITY).toBe('Twenty.com SAS');
    expect(resolved.values.PROCESSOR_LEGAL_FORM).toContain('France');
    expect(resolved.values.HOSTING_REGION).toContain('Frankfurt');
    expect(resolved.values.GOVERNING_LAW).toBe('France');
    expect(resolved.sccSectionActive).toBe(false);
    expect(resolved.templateVersion).toBe(DPA_TEMPLATE_VERSION);
  });

  it('resolves the US Processor entity, hosting and active SCC state', () => {
    const resolved = resolveDpa({ region: DpaRegion.US, mode: 'preview' });

    expect(resolved.region).toBe('US');
    expect(resolved.values.PROCESSOR_ENTITY).toBe('Twenty, Inc.');
    expect(resolved.values.PROCESSOR_LEGAL_FORM).toContain('Delaware');
    expect(resolved.values.HOSTING_REGION).toBe('the United States');
    expect(resolved.sccSectionActive).toBe(true);
  });

  it('substitutes the Processor entity into the contracting clause per region', () => {
    const eu = resolveDpa({ region: DpaRegion.EU, mode: 'preview' });
    const us = resolveDpa({ region: DpaRegion.US, mode: 'preview' });

    // The first block is the contracting clause ("...between {{PROCESSOR_ENTITY}}
    // ("Twenty" or "Processor")..."). The literal string "Twenty, Inc." also
    // appears verbatim elsewhere (Annex A's "for US deployments" note), so we
    // assert on the resolved contracting clause specifically, not the whole doc.
    expect(eu.blocks[0].text).toContain('between Twenty.com SAS (');
    expect(us.blocks[0].text).toContain('between Twenty, Inc. (');
  });

  it('keeps the SCC/transfer sections (7.2–7.5) in the document for BOTH regions (document is not branched)', () => {
    const eu = resolveDpa({ region: DpaRegion.EU, mode: 'preview' });
    const us = resolveDpa({ region: DpaRegion.US, mode: 'preview' });

    const headings = (blocks: typeof eu.blocks) =>
      blocks.filter((block) => block.kind === 'heading').map((b) => b.text);

    for (const resolved of [eu, us]) {
      const text = resolved.blocks.map((b) => b.text).join('\n');

      expect(headings(resolved.blocks)).toContain(
        '7. International Data Transfers',
      );
      expect(text).toContain('7.2 European Data Transfers');
      expect(text).toContain('7.3 Transfers from Brazil');
      expect(text).toContain('7.4 Other Transfer Mechanisms');
      expect(text).toContain('7.5 Disclosure of SCCs');
    }
  });

  it('leaves no unresolved {{ }} merge fields for any region', () => {
    for (const region of Object.keys(DPA_REGION_CONFIGS) as DpaRegion[]) {
      const resolved = resolveDpa({ region, mode: 'signed' });

      expect(findUnresolvedMergeFields(resolved)).toEqual([]);
    }
  });

  it('only appends the execution / signature block in signed mode', () => {
    const preview = resolveDpa({ region: DpaRegion.EU, mode: 'preview' });
    const signed = resolveDpa({
      region: DpaRegion.EU,
      mode: 'signed',
      customerLegalEntityName: 'Acme GmbH',
      signatory: { name: 'Jane Doe', title: 'CEO' },
      executedAt: '2026-06-26T00:00:00.000Z',
    });

    expect(preview.blocks.some((b) => b.kind === 'signatureField')).toBe(false);

    const customerField = signed.blocks.find(
      (b) => b.kind === 'signatureField' && b.label === 'Customer (Controller)',
    );

    expect(customerField?.value).toContain('Acme GmbH');
    expect(customerField?.value).toContain('Jane Doe');
    expect(customerField?.value).toContain('CEO');
    expect(
      signed.blocks.some(
        (b) => b.kind === 'signatureField' && b.label === 'Execution Date',
      ),
    ).toBe(true);
  });

  it('marks self-hosted deployments as not a valid agreement', () => {
    const cloud = resolveDpa({ region: DpaRegion.EU, mode: 'preview' });
    const selfHosted = resolveDpa({
      region: DpaRegion.EU,
      mode: 'preview',
      isSelfHosted: true,
    });

    expect(cloud.notice).toBeUndefined();
    expect(selfHosted.notice).toContain('NOT A VALID AGREEMENT');
  });

  it('records the template version so we can prove what was agreed', () => {
    const signed = resolveDpa({ region: DpaRegion.US, mode: 'signed' });

    const versionField = signed.blocks.find(
      (b) => b.kind === 'signatureField' && b.label === 'DPA template version',
    );

    expect(versionField?.value).toContain(DPA_TEMPLATE_VERSION);
  });
});
