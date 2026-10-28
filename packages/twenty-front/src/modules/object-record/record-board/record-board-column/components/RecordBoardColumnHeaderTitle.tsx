import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { RECORD_BOARD_COLUMN_ACCENT_CSS_VARIABLE_NAMES } from '@/object-record/record-board/constants/RecordBoardColumnAccentCssVariableNames';
import { RecordGroupChip } from '@/object-record/record-group/components/RecordGroupChip';
import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';

const StyledTitle = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledDot = styled.span`
  background-color: var(
    ${RECORD_BOARD_COLUMN_ACCENT_CSS_VARIABLE_NAMES.accent}
  );
  border-radius: 50%;
  flex-shrink: 0;
  height: 8px;
  width: 8px;
`;

const StyledTitleText = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type RecordBoardColumnHeaderTitleProps = {
  recordGroupDefinition: RecordGroupDefinition;
  fieldMetadataItem?: FieldMetadataItem | null;
};

export const RecordBoardColumnHeaderTitle = ({
  recordGroupDefinition,
  fieldMetadataItem,
}: RecordBoardColumnHeaderTitleProps) => {
  const isRelationGroup =
    isDefined(fieldMetadataItem) && isManyToOneRelationField(fieldMetadataItem);

  if (
    recordGroupDefinition.type !== RecordGroupDefinitionType.Value ||
    isRelationGroup
  ) {
    return (
      <RecordGroupChip
        recordGroupDefinition={recordGroupDefinition}
        fieldMetadataItem={fieldMetadataItem}
      />
    );
  }

  return (
    <StyledTitle title={recordGroupDefinition.title}>
      <StyledDot />
      <StyledTitleText>{recordGroupDefinition.title}</StyledTitleText>
    </StyledTitle>
  );
};
