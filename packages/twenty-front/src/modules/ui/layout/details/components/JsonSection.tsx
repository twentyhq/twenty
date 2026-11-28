import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { JsonTree } from 'twenty-ui/components/data-display';
import { LightButton } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { IconCopy } from 'twenty-ui/icon';
import { type JsonValue } from 'type-fest';

import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledJsonTreeContainer = styled.div`
  overflow-x: auto;
`;

type JsonSectionProps = {
  title: string;
  value: JsonValue;
};

export const JsonSection = ({ title, value }: JsonSectionProps) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  return (
    <Section.Root>
      <Section.Header
        title={title}
        actions={
          <LightButton
            startIcon={<IconCopy />}
            onClick={() =>
              copyToClipboard(JSON.stringify(value, null, 2), t`Copied as JSON`)
            }
          >
            {t`Copy as JSON`}
          </LightButton>
        }
      />
      <StyledJsonTreeContainer>
        <JsonTree
          value={value}
          emptyArrayLabel={t`Empty Array`}
          emptyObjectLabel={t`Empty Object`}
          emptyStringLabel={t`[empty string]`}
          arrowButtonCollapsedLabel={t`Expand`}
          arrowButtonExpandedLabel={t`Collapse`}
          onNodeValueClick={copyToClipboard}
        />
      </StyledJsonTreeContainer>
    </Section.Root>
  );
};
