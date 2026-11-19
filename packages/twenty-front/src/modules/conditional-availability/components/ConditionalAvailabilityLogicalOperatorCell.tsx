import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/hooks/useConditionalAvailabilityEditorContext';
import { getConditionalAvailabilityLogicalOperatorLabel } from '@/conditional-availability/utils/getConditionalAvailabilityLogicalOperatorLabel';
import { ConditionBuilderLogicalOperatorCell } from '@/ui/layout/condition-builder/components/ConditionBuilderLogicalOperatorCell';
import { useLingui } from '@lingui/react/macro';
import { doNotTranslate } from 'twenty-shared/i18n';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/types';

type ConditionalAvailabilityLogicalOperatorCellProps = {
  index: number;
  groupId: string | null;
  logicalOperator: ConditionalAvailabilityLogicalOperator;
};

export const ConditionalAvailabilityLogicalOperatorCell = ({
  index,
  groupId,
  logicalOperator,
}: ConditionalAvailabilityLogicalOperatorCellProps) => {
  const { t } = useLingui();
  const { itemKey, isReadOnly, setLogicalOperator } =
    useConditionalAvailabilityEditorContext();

  const logicalOperators: ConditionalAvailabilityLogicalOperator[] = [
    doNotTranslate('AND'),
    doNotTranslate('OR'),
  ];
  const options = logicalOperators.map((value) => ({
    value,
    label: getConditionalAvailabilityLogicalOperatorLabel({
      logicalOperator: value,
    }),
  }));

  return (
    <ConditionBuilderLogicalOperatorCell
      index={index}
      value={logicalOperator}
      options={options}
      onChange={(nextLogicalOperator) =>
        setLogicalOperator(groupId, nextLogicalOperator)
      }
      isReadOnly={isReadOnly}
      dropdownId={`conditional-availability-logical-operator-${itemKey}-${groupId ?? 'root'}`}
      firstLabel={t`Where`}
      laterLabel={getConditionalAvailabilityLogicalOperatorLabel({
        logicalOperator,
      })}
    />
  );
};
