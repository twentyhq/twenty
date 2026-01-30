import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRef, useState } from 'react';

import { JsonDisplay } from '@/ui/field/display/components/JsonDisplay';
import { ExpandedFieldDisplay } from '@/ui/layout/expandable-list/components/ExpandedFieldDisplay';
import { type JsonValue } from 'type-fest';
import { isDefined } from 'twenty-shared/utils';
import { isTwoFirstDepths, JsonTree } from 'twenty-ui/json-visualizer';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

type EventLogJsonCellProps = {
  value: Record<string, unknown> | null | undefined;
};

const StyledJsonContainer = styled.div`
  cursor: pointer;
`;

const StyledEmptyCell = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const EventLogJsonCell = ({ value }: EventLogJsonCellProps) => {
  const { copyToClipboard } = useCopyToClipboard();
  const [isExpanded, setIsExpanded] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  if (!isDefined(value) || Object.keys(value).length === 0) {
    return <StyledEmptyCell>-</StyledEmptyCell>;
  }

  const handleClick = () => {
    setIsExpanded(true);
  };

  const handleClickOutside = () => {
    setIsExpanded(false);
  };

  return (
    <>
      <StyledJsonContainer ref={anchorRef} onClick={handleClick}>
        <JsonDisplay text={JSON.stringify(value)} />
      </StyledJsonContainer>
      {isExpanded && (
        <ExpandedFieldDisplay
          anchorElement={anchorRef.current ?? undefined}
          onClickOutside={handleClickOutside}
        >
          <JsonTree
            value={value as JsonValue}
            shouldExpandNodeInitially={isTwoFirstDepths}
            emptyArrayLabel={t`Empty Array`}
            emptyObjectLabel={t`Empty Object`}
            emptyStringLabel={t`[empty string]`}
            arrowButtonCollapsedLabel={t`Expand`}
            arrowButtonExpandedLabel={t`Collapse`}
            onNodeValueClick={copyToClipboard}
          />
        </ExpandedFieldDisplay>
      )}
    </>
  );
};
