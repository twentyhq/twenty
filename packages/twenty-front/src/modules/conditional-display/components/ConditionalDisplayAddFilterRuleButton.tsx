import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { useConditionalDisplayBuilderContext } from '@/conditional-display/contexts/ConditionalDisplayBuilderContext';
import { useAddConditionalDisplayRecordFilter } from '@/conditional-display/hooks/useAddConditionalDisplayRecordFilter';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';

export const ConditionalDisplayAddFilterRuleButton = () => {
  const { t } = useLingui();

  const { availableContextKeys } = useConditionalDisplayBuilderContext();

  const { addConditionalDisplayRecordFilter } =
    useAddConditionalDisplayRecordFilter();

  const [defaultContextKey] = availableContextKeys;

  if (!isDefined(defaultContextKey)) {
    return null;
  }

  return (
    <CommandMenuButton
      command={{
        Icon: IconPlus,
        label: t`Add filter rule`,
        shortLabel: t`Add filter rule`,
        key: 'add-filter-rule',
      }}
      onClick={() => addConditionalDisplayRecordFilter(defaultContextKey)}
    />
  );
};
