import { ConditionalAvailabilityFilterBuilder } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterBuilder';
import { convertConditionalAvailabilityFilterOrGroupToNode } from '@/conditional-availability/filter-builder/filters-to-nodes/utils/convertConditionalAvailabilityFilterOrGroupToNode';
import { useConditionalAvailabilityFilterFields } from '@/conditional-availability/filter-builder/hooks/useConditionalAvailabilityFilterFields';
import { convertConditionalAvailabilityNodeToFilterGroup } from '@/conditional-availability/filter-builder/nodes-to-filters/utils/convertConditionalAvailabilityNodeToFilterGroup';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { createEmptyConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/utils/createEmptyConditionalAvailabilityFilter';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetConditionalAvailabilityUpdate } from '@/side-panel/pages/page-layout/utils/getWidgetConditionalAvailabilityUpdate';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { IconEye, IconEyeX } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { v4 } from 'uuid';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledText = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

type WidgetVisibilitySettingsProps = {
  pageLayoutId: string;
  widget: Pick<PageLayoutWidget, 'id' | 'conditionalAvailability'>;
};

export const WidgetVisibilitySettings = ({
  pageLayoutId,
  widget,
}: WidgetVisibilitySettingsProps) => {
  const { t } = useLingui();
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);
  const filterFields = useConditionalAvailabilityFilterFields();

  const [defaultFilterGroup, setDefaultFilterGroup] =
    useState<ConditionalAvailabilityFilterGroup | null>(() =>
      isDefined(widget.conditionalAvailability)
        ? convertConditionalAvailabilityNodeToFilterGroup({
            node: widget.conditionalAvailability,
          })
        : null,
    );

  const widgetVisibility =
    isDefined(defaultFilterGroup) || isDefined(widget.conditionalAvailability)
      ? 'CUSTOM_RULE'
      : 'EVERYONE';

  const handleWidgetVisibilityChange = (
    nextWidgetVisibility: 'EVERYONE' | 'CUSTOM_RULE',
  ) => {
    if (nextWidgetVisibility === 'EVERYONE') {
      setDefaultFilterGroup(null);
      updatePageLayoutWidget(
        widget.id,
        getWidgetConditionalAvailabilityUpdate({
          conditionalAvailability: null,
        }),
      );

      return;
    }

    setDefaultFilterGroup({
      type: 'filterGroup',
      id: v4(),
      logicalOperator: doNotTranslate('AND'),
      children: [
        createEmptyConditionalAvailabilityFilter({ variable: 'currentRole' }),
      ],
    });
  };

  const handleFilterSettingsUpdate = (
    filterSettings: ConditionalAvailabilityFilterGroup,
  ) => {
    updatePageLayoutWidget(
      widget.id,
      getWidgetConditionalAvailabilityUpdate({
        conditionalAvailability:
          convertConditionalAvailabilityFilterOrGroupToNode({
            filterOrGroup: filterSettings,
          }),
      }),
    );
  };

  return (
    <StyledContainer>
      <Select
        dropdownId={`widget-visibility-${widget.id}`}
        options={[
          { value: 'EVERYONE', label: t`Everyone`, Icon: IconEye },
          { value: 'CUSTOM_RULE', label: t`Custom rule`, Icon: IconEyeX },
        ]}
        value={widgetVisibility}
        onChange={handleWidgetVisibilityChange}
        fullWidth
      />
      {isDefined(defaultFilterGroup) && (
        <ConditionalAvailabilityFilterBuilder
          instanceId={widget.id}
          filterFields={filterFields}
          defaultValue={defaultFilterGroup}
          onFilterSettingsUpdate={handleFilterSettingsUpdate}
        />
      )}
      {widgetVisibility === 'CUSTOM_RULE' && !isDefined(defaultFilterGroup) && (
        <StyledText>{t`This rule cannot be edited here. Select Everyone to remove it.`}</StyledText>
      )}
    </StyledContainer>
  );
};
