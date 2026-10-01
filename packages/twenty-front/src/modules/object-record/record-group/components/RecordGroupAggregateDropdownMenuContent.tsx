import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components';

export const RecordGroupAggregateDropdownMenuContent = () => {
  const { t } = useLingui();

  return (
    <Dropdown.Section>
      <Dropdown.ActionItem page="countAggregateOperationsOptions">{t`Count`}</Dropdown.ActionItem>
      <Dropdown.ActionItem page="percentAggregateOperationsOptions">{t`Percent`}</Dropdown.ActionItem>
      <Dropdown.ActionItem page="datesAggregateOperationOptions">{t`Date`}</Dropdown.ActionItem>
      <Dropdown.ActionItem page="moreAggregateOperationOptions">{t`More options`}</Dropdown.ActionItem>
    </Dropdown.Section>
  );
};
