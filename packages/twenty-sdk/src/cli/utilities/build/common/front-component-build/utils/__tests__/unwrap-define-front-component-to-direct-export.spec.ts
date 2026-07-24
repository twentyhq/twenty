import { unwrapDefineFrontComponentToDirectExport } from '@/cli/utilities/build/common/front-component-build/utils/unwrap-define-front-component-to-direct-export';

const INLINE_EXPRESSION_COMPONENT_SOURCE = `import { defineFrontComponent } from 'twenty-sdk/define';

import { SUMMARIZE_COMPANY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createSummarizeRecordEffect } from 'src/front-components/utils/create-summarize-record-effect';
import { SUMMARIZE_TARGETS } from 'src/front-components/utils/summarize-target';

const SummarizeRecordEffect = createSummarizeRecordEffect(SUMMARIZE_TARGETS.company)

export default defineFrontComponent({
  universalIdentifier: SUMMARIZE_COMPANY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Summarize Company',
  description: 'Asks AI to summarize the selected company',
  isHeadless: true,
  component: createSummarizeRecordEffect(SUMMARIZE_TARGETS.company),
});
`;

const IDENTIFIER_COMPONENT_SOURCE = `import { defineFrontComponent } from 'twenty-sdk/define';

import { SUMMARIZE_COMPANY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createSummarizeRecordEffect } from 'src/front-components/utils/create-summarize-record-effect';
import { SUMMARIZE_TARGETS } from 'src/front-components/utils/summarize-target';

const SummarizeRecordEffect = createSummarizeRecordEffect(SUMMARIZE_TARGETS.company)

export default defineFrontComponent({
  universalIdentifier: SUMMARIZE_COMPANY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Summarize Company',
  description: 'Asks AI to summarize the selected company',
  isHeadless: true,
  component: SummarizeRecordEffect,
});
`;

describe('unwrapDefineFrontComponentToDirectExport', () => {
  it('renders the component when component is an inline factory call', () => {
    const output = unwrapDefineFrontComponentToDirectExport(
      INLINE_EXPRESSION_COMPONENT_SOURCE,
    );

    expect(output).toContain(
      'component: createSummarizeRecordEffect(SUMMARIZE_TARGETS.company),',
    );
    expect(output).toContain(
      '__frontComponentJsx(__frontComponentDefinition.component, {})',
    );
    expect(output).not.toContain('defineFrontComponent');
  });

  it('renders the component when component is a bare identifier', () => {
    const output = unwrapDefineFrontComponentToDirectExport(
      IDENTIFIER_COMPONENT_SOURCE,
    );

    expect(output).toContain('component: SummarizeRecordEffect,');
    expect(output).toContain(
      '__frontComponentJsx(__frontComponentDefinition.component, {})',
    );
    expect(output).not.toContain('defineFrontComponent');
  });

  it('produces an equivalent renderer for the inline and identifier forms', () => {
    const inlineOutput = unwrapDefineFrontComponentToDirectExport(
      INLINE_EXPRESSION_COMPONENT_SOURCE,
    );
    const identifierOutput = unwrapDefineFrontComponentToDirectExport(
      IDENTIFIER_COMPONENT_SOURCE,
    );

    const renderer =
      '\nexport default function __renderFrontComponent(__container) { __createRoot(__container).render(__frontComponentJsx(__frontComponentDefinition.component, {})); }\n';

    expect(inlineOutput).toContain(renderer);
    expect(identifierOutput).toContain(renderer);
  });

  it('leaves a source without a defineFrontComponent default export untouched', () => {
    const source = `import { useEffect } from 'react';

export const createSummarizeRecordEffect = () => () => null;
`;

    expect(unwrapDefineFrontComponentToDirectExport(source)).toBe(source);
  });
});
