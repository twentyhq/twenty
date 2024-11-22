import { BORDER_COMMON, Chip, ChipVariant } from 'twenty-ui';

import { FieldArrayValue } from '@/object-record/record-field/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import styled from '@emotion/styled';

type ArrayDisplayProps = {
  value: FieldArrayValue;
  isFocused?: boolean;
  isInputDisplay?: boolean;
};

const StyledTag = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  border-radius: ${BORDER_COMMON.radius.sm};
`;

export const ArrayDisplay = ({ value }: ArrayDisplayProps) => {
  return (
    <ExpandableList>
      {value?.map((item) => (
        <Chip variant={ChipVariant.Highlighted} label={item} />
      ))}
    </ExpandableList>
  );
};
