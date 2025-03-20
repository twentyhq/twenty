import { useJsonFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useJsonFieldDisplay';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { JsonDisplay } from '@/ui/field/display/components/JsonDisplay';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import styled from '@emotion/styled';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isTwoFirstDepths, JsonTree } from 'twenty-ui';

const StyledJsonTreeContainer = styled.div`
  height: 300px;
  padding: ${({ theme }) => theme.spacing(2)};
  overflow: auto;
  position: relative;
`;

export const JsonFieldDisplay = () => {
  const { fieldValue, maxWidth } = useJsonFieldDisplay();
  const id = useId();

  if (!isDefined(fieldValue)) {
    return <></>;
  }

  const value = JSON.stringify(fieldValue);

  return (
    <Dropdown
      clickableComponent={<JsonDisplay text={value} maxWidth={maxWidth} />}
      dropdownMenuWidth={400}
      dropdownComponents={
        <StyledJsonTreeContainer>
          <JsonTree
            value={fieldValue}
            arrowButtonCollapsedLabel=""
            arrowButtonExpandedLabel=""
            emptyArrayLabel=""
            emptyObjectLabel=""
            emptyStringLabel=""
            shouldExpandNodeInitially={isTwoFirstDepths}
          />
        </StyledJsonTreeContainer>
      }
      dropdownHotkeyScope={{
        scope: TableHotkeyScope.TableSoftFocus,
      }}
      dropdownId={id}
    />
  );
};
