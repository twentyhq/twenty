import { ConditionalAvailabilityHelperText } from '@/conditional-availability/components/ConditionalAvailabilityHelperText';
import { ConditionalAvailabilityReadOnlyNote } from '@/conditional-availability/components/ConditionalAvailabilityReadOnlyNote';
import { ConditionalAvailabilityRowList } from '@/conditional-availability/components/ConditionalAvailabilityRowList';
import { ConditionalAvailabilityUnsupportedRule } from '@/conditional-availability/components/ConditionalAvailabilityUnsupportedRule';
import { ConditionalAvailabilityEditorContext } from '@/conditional-availability/contexts/ConditionalAvailabilityEditorContext';
import { useConditionalAvailabilityDraft } from '@/conditional-availability/hooks/useConditionalAvailabilityDraft';
import { useConditionalAvailabilityFields } from '@/conditional-availability/hooks/useConditionalAvailabilityFields';
import { useConditionalAvailabilityRoles } from '@/conditional-availability/hooks/useConditionalAvailabilityRoles';
import { type ConditionalAvailabilityEditorTopSelectValue } from '@/conditional-availability/types/ConditionalAvailabilityEditorTopSelectValue';
import { getConditionalAvailabilityReadOnlyReason } from '@/conditional-availability/utils/getConditionalAvailabilityReadOnlyReason';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  type ConditionalAvailabilityMetadataName,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/types';
import {
  assertUnreachable,
  isDefined,
  printConditionalAvailabilityNode,
} from 'twenty-shared/utils';
import { IconEye, IconEyeX } from 'twenty-ui/icon';
import { Field, type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

type ConditionalAvailabilityEditorProps = {
  metadataName: ConditionalAvailabilityMetadataName;
  itemKey: string;
  node: ConditionalAvailabilityNode | null;
  objectMetadataItem: EnrichedObjectMetadataItem | null;
  onNodeChange: (node: ConditionalAvailabilityNode | null) => void;
};

export const ConditionalAvailabilityEditor = ({
  metadataName,
  itemKey,
  node,
  objectMetadataItem,
  onNodeChange,
}: ConditionalAvailabilityEditorProps) => {
  const { t } = useLingui();
  const conditionalAvailabilityRoles = useConditionalAvailabilityRoles();
  const { hasRolesPermission } = conditionalAvailabilityRoles;

  const conditionalAvailabilityFields = useConditionalAvailabilityFields({
    metadataName,
    objectMetadataItem,
  });

  const conditionalAvailabilityDraft = useConditionalAvailabilityDraft({
    metadataName,
    itemKey,
    node,
    fields: conditionalAvailabilityFields.fields,
    hasRolesPermission,
    onNodeChange,
  });
  const { editorState, chooseEveryone, chooseCustomRule } =
    conditionalAvailabilityDraft;

  const readOnlyReason = getConditionalAvailabilityReadOnlyReason({
    node,
    hasRolesPermission,
  });
  const isReadOnly = readOnlyReason.status === 'readOnly';
  const hasRule = editorState.mode !== 'everyone';

  const handleTopSelectChange = (
    value: ConditionalAvailabilityEditorTopSelectValue,
  ) => {
    switch (value) {
      case 'everyone':
        chooseEveryone();
        return;
      case 'customRule':
        chooseCustomRule();
        return;
      default:
        assertUnreachable(value);
    }
  };

  const topSelectOptions: SelectOption<ConditionalAvailabilityEditorTopSelectValue>[] =
    [
      {
        value: 'everyone',
        label: t`Everyone`,
        Icon: IconEye,
        disabled: isReadOnly,
      },
      { value: 'customRule', label: t`Custom rule`, Icon: IconEyeX },
    ];

  const renderBody = () => {
    switch (editorState.mode) {
      case 'everyone':
        return null;
      case 'customRule':
        return (
          <ConditionalAvailabilityRowList
            metadataName={metadataName}
            tree={editorState.tree}
          />
        );
      case 'unsupportedRule':
        return (
          <ConditionalAvailabilityUnsupportedRule
            expression={
              isDefined(node) ? printConditionalAvailabilityNode({ node }) : ''
            }
          />
        );
      default:
        return assertUnreachable(editorState);
    }
  };

  return (
    <ConditionalAvailabilityEditorContext.Provider
      value={{
        ...conditionalAvailabilityDraft,
        ...conditionalAvailabilityRoles,
        ...conditionalAvailabilityFields,
        itemKey,
        isReadOnly,
      }}
    >
      <StyledContainer>
        <Field.Root render={<StyledHeader />}>
          <Select
            dropdownId={`conditional-availability-top-select-${itemKey}`}
            options={topSelectOptions}
            value={hasRule ? 'customRule' : 'everyone'}
            onChange={handleTopSelectChange}
            disabled={isReadOnly}
            fullWidth
          />
          {hasRule && (
            <ConditionalAvailabilityHelperText metadataName={metadataName} />
          )}
          {readOnlyReason.status === 'readOnly' && (
            <ConditionalAvailabilityReadOnlyNote
              reason={readOnlyReason.reason}
            />
          )}
        </Field.Root>
        {renderBody()}
      </StyledContainer>
    </ConditionalAvailabilityEditorContext.Provider>
  );
};
