import { ConditionalAvailabilityRow } from '@/conditional-availability/components/ConditionalAvailabilityRow';
import { ConditionalAvailabilityRowGroup } from '@/conditional-availability/components/ConditionalAvailabilityRowGroup';
import { ConditionalAvailabilityRulesError } from '@/conditional-availability/components/ConditionalAvailabilityRulesError';
import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/hooks/useConditionalAvailabilityEditorContext';
import { type ConditionalAvailabilityRowTree } from '@/conditional-availability/types/ConditionalAvailabilityRowTree';
import { validateConditionalAvailabilityRules } from '@/conditional-availability/utils/validateConditionalAvailabilityRules';
import { ConditionBuilderAddRuleMenu } from '@/ui/layout/condition-builder/components/ConditionBuilderAddRuleMenu';
import { styled } from '@linaria/react';
import { type ConditionalAvailabilityMetadataName } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
`;

const StyledChildren = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
`;

const StyledAddRuleContainer = styled.div`
  align-self: flex-start;
`;

type ConditionalAvailabilityRowListProps = {
  metadataName: ConditionalAvailabilityMetadataName;
  tree: ConditionalAvailabilityRowTree;
};

export const ConditionalAvailabilityRowList = ({
  metadataName,
  tree,
}: ConditionalAvailabilityRowListProps) => {
  const { itemKey, isReadOnly, addRow, addGroup } =
    useConditionalAvailabilityEditorContext();

  const rulesValidation = validateConditionalAvailabilityRules({
    tree,
    metadataName,
  });

  return (
    <StyledContainer>
      {isNonEmptyArray(tree.children) && (
        <StyledChildren>
          {tree.children.map((child, index) =>
            child.type === 'row' ? (
              <ConditionalAvailabilityRow
                key={child.row.id}
                index={index}
                groupId={null}
                logicalOperator={tree.logicalOperator}
                row={child.row}
              />
            ) : (
              <ConditionalAvailabilityRowGroup
                key={child.group.id}
                index={index}
                logicalOperator={tree.logicalOperator}
                group={child.group}
              />
            ),
          )}
        </StyledChildren>
      )}
      <ConditionalAvailabilityRulesError rulesValidation={rulesValidation} />
      {!isReadOnly && (
        <StyledAddRuleContainer>
          <ConditionBuilderAddRuleMenu
            dropdownId={`conditional-availability-add-rule-${itemKey}`}
            canAddGroup
            onAddRule={() => addRow(null)}
            onAddGroup={addGroup}
          />
        </StyledAddRuleContainer>
      )}
    </StyledContainer>
  );
};
