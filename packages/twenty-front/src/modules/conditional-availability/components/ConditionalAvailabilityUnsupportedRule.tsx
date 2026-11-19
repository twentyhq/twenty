import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/contexts/ConditionalAvailabilityEditorContext';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Button, Field, Textarea } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledActions = styled.div`
  display: flex;
`;

type ConditionalAvailabilityUnsupportedRuleProps = {
  expression: string;
};

export const ConditionalAvailabilityUnsupportedRule = ({
  expression,
}: ConditionalAvailabilityUnsupportedRuleProps) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const { itemKey, isReadOnly, replaceWithRules } =
    useConditionalAvailabilityEditorContext();

  const replaceWithRulesDialogId = `conditional-availability-replace-with-rules-${itemKey}`;

  return (
    <>
      <Field.Root render={<StyledField />}>
        <Textarea
          aria-label={t`Rule`}
          value={expression}
          readOnly
          autoResize
          rows={3}
          spellCheck={false}
        />
        <Field.Description>
          {t`This rule cannot be shown as rows. It keeps working as it is.`}
        </Field.Description>
        {!isReadOnly && (
          <StyledActions>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDialog(replaceWithRulesDialogId)}
            >
              {t`Replace with rules`}
            </Button>
          </StyledActions>
        )}
      </Field.Root>
      <ConfirmationDialog
        dialogId={replaceWithRulesDialogId}
        title={t`Replace with rules`}
        subtitle={t`The current rule will be removed and replaced with an empty rule. This cannot be undone.`}
        onConfirmClick={replaceWithRules}
        confirmButtonText={t`Replace`}
        confirmButtonColor="danger"
      />
    </>
  );
};
