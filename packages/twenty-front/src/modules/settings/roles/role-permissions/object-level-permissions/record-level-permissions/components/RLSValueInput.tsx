import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconUserCircle } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { AdvancedFilterCommandMenuValueFormInput } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuValueFormInput';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RLSMeValueSelect } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/RLSMeValueSelect';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(1)};
  flex: 1;
`;

const StyledValueContainer = styled.div`
  flex: 1;
`;

const StyledDynamicValueDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background-color: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  min-height: ${({ theme }) => theme.spacing(8)};
`;

const StyledMeLabel = styled.span`
  color: ${({ theme }) => theme.color.blue};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

type RLSValueInputProps = {
  recordFilterId: string;
};

export const RLSValueInput = ({ recordFilterId }: RLSValueInputProps) => {
  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const recordFilter = currentRecordFilters.find(
    (filter) => filter.id === recordFilterId,
  );

  const { objectMetadataItem: workspaceMemberMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    });

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const dynamicValue = recordFilter?.rlsDynamicValue;
  const isDynamicMode = isDefined(dynamicValue);

  // Get the workspace member field label for display
  const workspaceMemberFieldLabel = useMemo(() => {
    if (!dynamicValue) {
      return null;
    }

    // Look up the field name from workspace member metadata
    const workspaceMemberField = workspaceMemberMetadataItem?.fields.find(
      (field) => field.id === dynamicValue.workspaceMemberFieldMetadataId,
    );

    if (isDefined(workspaceMemberField)) {
      // If it's the id field, just show "Me" (no label needed)
      if (workspaceMemberField.name === 'id') {
        return null;
      }
      return workspaceMemberField.label;
    }

    // Fallback to subFieldName or field ID if field not found
    return (
      dynamicValue.workspaceMemberSubFieldName ??
      dynamicValue.workspaceMemberFieldMetadataId
    );
  }, [dynamicValue, workspaceMemberMetadataItem?.fields]);

  const handleSelectDynamicValue = (
    workspaceMemberFieldMetadataId: string,
    workspaceMemberSubFieldName?: string | null,
  ) => {
    if (!recordFilter) {
      return;
    }

    upsertRecordFilter({
      ...recordFilter,
      value: '',
      rlsDynamicValue: {
        workspaceMemberFieldMetadataId,
        workspaceMemberSubFieldName: workspaceMemberSubFieldName ?? null,
      },
    });
  };

  const handleResetToStaticValue = () => {
    if (!recordFilter) {
      return;
    }

    upsertRecordFilter({
      ...recordFilter,
      rlsDynamicValue: null,
    });
  };

  if (isDynamicMode) {
    return (
      <StyledContainer>
        <StyledValueContainer>
          <StyledDynamicValueDisplay>
            <IconUserCircle size={16} />
            <StyledMeLabel>{t`Me`}</StyledMeLabel>
            {isDefined(workspaceMemberFieldLabel) && (
              <>
                <span>/</span>
                <span>{workspaceMemberFieldLabel}</span>
              </>
            )}
          </StyledDynamicValueDisplay>
        </StyledValueContainer>
        <IconButton
          Icon={IconUserCircle}
          variant="tertiary"
          onClick={handleResetToStaticValue}
          aria-label={t`Reset to static value`}
        />
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledValueContainer>
        <AdvancedFilterCommandMenuValueFormInput
          recordFilterId={recordFilterId}
        />
      </StyledValueContainer>
      <Dropdown
        dropdownId={`workspace-member-field-select-${recordFilterId}`}
        clickableComponent={
          <IconButton
            Icon={IconUserCircle}
            variant="tertiary"
            aria-label={t`Use dynamic value from current user`}
          />
        }
        dropdownComponents={
          <RLSMeValueSelect
            onSelect={handleSelectDynamicValue}
            recordFilterId={recordFilterId}
          />
        }
        dropdownPlacement="bottom-end"
      />
    </StyledContainer>
  );
};
