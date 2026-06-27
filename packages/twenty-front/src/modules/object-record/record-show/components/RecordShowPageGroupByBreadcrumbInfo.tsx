import { useRecordGroupByFieldMetadataItem } from '@/object-record/record-show/hooks/useRecordGroupByFieldMetadataItem';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledSeparator = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  padding-left: ${themeCssVariables.spacing['0.5']};
  padding-right: ${themeCssVariables.spacing['0.5']};
`;

const StyledGroupByInfo = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: row;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  white-space: nowrap;
`;

export const RecordShowPageGroupByBreadcrumbInfo = () => {
  const groupByFieldMetadataItem = useRecordGroupByFieldMetadataItem();
  const { getIcon } = useIcons();

  if (!isDefined(groupByFieldMetadataItem)) return null;

  const FieldIcon = getIcon(groupByFieldMetadataItem.icon);
  return (
    <StyledContainer>
      <StyledSeparator>{'->'}</StyledSeparator>
      <StyledGroupByInfo>
        {isDefined(FieldIcon) && <FieldIcon size={14} stroke={2} />}
        {t`Grouped by ${groupByFieldMetadataItem.label}`}
      </StyledGroupByInfo>
    </StyledContainer>
  );
};
