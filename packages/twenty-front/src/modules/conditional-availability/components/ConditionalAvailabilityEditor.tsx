import { ConditionalAvailabilityPermissionsLink } from '@/conditional-availability/components/ConditionalAvailabilityPermissionsLink';
import { ConditionalAvailabilityReadOnlyNote } from '@/conditional-availability/components/ConditionalAvailabilityReadOnlyNote';
import { ConditionalAvailabilityRowList } from '@/conditional-availability/components/ConditionalAvailabilityRowList';
import { ConditionalAvailabilityUnsupportedRule } from '@/conditional-availability/components/ConditionalAvailabilityUnsupportedRule';
import { ConditionalAvailabilityEditorProvider } from '@/conditional-availability/contexts/ConditionalAvailabilityEditorContext';
import { useConditionalAvailabilityDraft } from '@/conditional-availability/hooks/useConditionalAvailabilityDraft';
import { useConditionalAvailabilityRoles } from '@/conditional-availability/hooks/useConditionalAvailabilityRoles';
import { type ConditionalAvailabilityEditorState } from '@/conditional-availability/types/ConditionalAvailabilityEditorState';
import { getConditionalAvailabilityReadOnlyReason } from '@/conditional-availability/utils/getConditionalAvailabilityReadOnlyReason';
import { getConditionalAvailabilityVisibilityStatusIcon } from '@/conditional-availability/utils/getConditionalAvailabilityVisibilityStatusIcon';
import { getConditionalAvailabilityVisibilityStatusLabel } from '@/conditional-availability/utils/getConditionalAvailabilityVisibilityStatusLabel';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import {
  type ConditionalAvailabilityMetadataName,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/types';
import {
  assertUnreachable,
  isDefined,
  printConditionalAvailabilityNode,
} from 'twenty-shared/utils';
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

type ConditionalAvailabilityEditorTopSelectValue = Exclude<
  ConditionalAvailabilityEditorState['mode'],
  'unsupportedRule'
>;

const TOP_SELECT_VALUES: ConditionalAvailabilityEditorTopSelectValue[] = [
  'everyone',
  'customRule',
];

type ConditionalAvailabilityEditorProps = {
  metadataName: ConditionalAvailabilityMetadataName;
  itemKey: string;
  node: ConditionalAvailabilityNode | null;
  onNodeChange: (node: ConditionalAvailabilityNode | null) => void;
};

export const ConditionalAvailabilityEditor = ({
  metadataName,
  itemKey,
  node,
  onNodeChange,
}: ConditionalAvailabilityEditorProps) => {
  const conditionalAvailabilityRoles = useConditionalAvailabilityRoles();
  const { hasRolesPermission } = conditionalAvailabilityRoles;

  const conditionalAvailabilityDraft = useConditionalAvailabilityDraft({
    metadataName,
    itemKey,
    node,
    hasRolesPermission,
    onNodeChange,
  });
  const { editorState, chooseEveryone, chooseCustomRule } =
    conditionalAvailabilityDraft;

  const readOnlyReason = getConditionalAvailabilityReadOnlyReason({
    node,
    hasRolesPermission,
  });
  const isReadOnly = isDefined(readOnlyReason);
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
    TOP_SELECT_VALUES.map((value) => ({
      value,
      label: getConditionalAvailabilityVisibilityStatusLabel({
        visibilityStatus: value,
      }),
      Icon: getConditionalAvailabilityVisibilityStatusIcon({
        visibilityStatus: value,
      }),
      disabled: value === 'everyone' && isReadOnly,
    }));

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
        if (!isDefined(node)) {
          return null;
        }

        return (
          <ConditionalAvailabilityUnsupportedRule
            expression={printConditionalAvailabilityNode({ node })}
          />
        );
      default:
        return assertUnreachable(editorState);
    }
  };

  return (
    <ConditionalAvailabilityEditorProvider
      value={{
        ...conditionalAvailabilityDraft,
        ...conditionalAvailabilityRoles,
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
            <Field.Description>
              <Trans>
                Visibility hides this item on the page. It does not restrict
                access to data;{' '}
                <ConditionalAvailabilityPermissionsLink>
                  role permissions
                </ConditionalAvailabilityPermissionsLink>{' '}
                do that.
              </Trans>
            </Field.Description>
          )}
          {isDefined(readOnlyReason) && (
            <ConditionalAvailabilityReadOnlyNote reason={readOnlyReason} />
          )}
        </Field.Root>
        {renderBody()}
      </StyledContainer>
    </ConditionalAvailabilityEditorProvider>
  );
};
