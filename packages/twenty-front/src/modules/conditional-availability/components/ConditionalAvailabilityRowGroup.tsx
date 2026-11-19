import { ConditionalAvailabilityLogicalOperatorCell } from '@/conditional-availability/components/ConditionalAvailabilityLogicalOperatorCell';
import { ConditionalAvailabilityRow } from '@/conditional-availability/components/ConditionalAvailabilityRow';
import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/hooks/useConditionalAvailabilityEditorContext';
import { type ConditionalAvailabilityRowGroup as ConditionalAvailabilityRowGroupType } from '@/conditional-availability/types/ConditionalAvailabilityRowGroup';
import { ConditionBuilderAddRuleMenu } from '@/ui/layout/condition-builder/components/ConditionBuilderAddRuleMenu';
import { ConditionBuilderGroupFrame } from '@/ui/layout/condition-builder/components/ConditionBuilderGroupFrame';
import { ConditionBuilderRowFrame } from '@/ui/layout/condition-builder/components/ConditionBuilderRowFrame';
import { ConditionBuilderRowMenu } from '@/ui/layout/condition-builder/components/ConditionBuilderRowMenu';
import { useLingui } from '@lingui/react/macro';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/types';

type ConditionalAvailabilityRowGroupProps = {
  index: number;
  logicalOperator: ConditionalAvailabilityLogicalOperator;
  group: ConditionalAvailabilityRowGroupType;
};

export const ConditionalAvailabilityRowGroup = ({
  index,
  logicalOperator,
  group,
}: ConditionalAvailabilityRowGroupProps) => {
  const { t } = useLingui();
  const { itemKey, isReadOnly, removeNode, addRow } =
    useConditionalAvailabilityEditorContext();

  return (
    <ConditionBuilderRowFrame
      header={
        <ConditionalAvailabilityLogicalOperatorCell
          index={index}
          groupId={null}
          logicalOperator={logicalOperator}
        />
      }
      menu={
        isReadOnly ? null : (
          <ConditionBuilderRowMenu
            dropdownId={`conditional-availability-group-menu-${itemKey}-${group.id}`}
            ariaLabel={t`Rule group options`}
            deleteLabel={t`Delete group`}
            align="end"
            onDelete={() => removeNode(group.id)}
          />
        )
      }
    >
      <ConditionBuilderGroupFrame isNested>
        {group.rows.map((row, rowIndex) => (
          <ConditionalAvailabilityRow
            key={row.id}
            index={rowIndex}
            groupId={group.id}
            logicalOperator={group.logicalOperator}
            row={row}
          />
        ))}
        {!isReadOnly && (
          <ConditionBuilderAddRuleMenu
            dropdownId={`conditional-availability-add-group-rule-${itemKey}-${group.id}`}
            canAddGroup={false}
            onAddRule={() => addRow(group.id)}
          />
        )}
      </ConditionBuilderGroupFrame>
    </ConditionBuilderRowFrame>
  );
};
