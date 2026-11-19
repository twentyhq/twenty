import { ConditionalAvailabilityLogicalOperatorCell } from '@/conditional-availability/components/ConditionalAvailabilityLogicalOperatorCell';
import { ConditionalAvailabilityRowFields } from '@/conditional-availability/components/ConditionalAvailabilityRowFields';
import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/hooks/useConditionalAvailabilityEditorContext';
import { type ConditionalAvailabilityRow as ConditionalAvailabilityRowType } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { ConditionBuilderRowFrame } from '@/ui/layout/condition-builder/components/ConditionBuilderRowFrame';
import { ConditionBuilderRowMenu } from '@/ui/layout/condition-builder/components/ConditionBuilderRowMenu';
import { useLingui } from '@lingui/react/macro';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/types';

type ConditionalAvailabilityRowProps = {
  index: number;
  groupId: string | null;
  logicalOperator: ConditionalAvailabilityLogicalOperator;
  row: ConditionalAvailabilityRowType;
};

export const ConditionalAvailabilityRow = ({
  index,
  groupId,
  logicalOperator,
  row,
}: ConditionalAvailabilityRowProps) => {
  const { t } = useLingui();
  const { itemKey, isReadOnly, removeNode } =
    useConditionalAvailabilityEditorContext();

  return (
    <ConditionBuilderRowFrame
      header={
        <ConditionalAvailabilityLogicalOperatorCell
          index={index}
          groupId={groupId}
          logicalOperator={logicalOperator}
        />
      }
      menu={
        isReadOnly ? null : (
          <ConditionBuilderRowMenu
            dropdownId={`conditional-availability-row-menu-${itemKey}-${row.id}`}
            ariaLabel={t`Rule options`}
            deleteLabel={t`Delete`}
            align="end"
            onDelete={() => removeNode(row.id)}
          />
        )
      }
    >
      <ConditionalAvailabilityRowFields row={row} />
    </ConditionBuilderRowFrame>
  );
};
