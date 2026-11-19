import { ConditionalAvailabilityOperatorSelect } from '@/conditional-availability/components/ConditionalAvailabilityOperatorSelect';
import { ConditionalAvailabilitySubjectSelect } from '@/conditional-availability/components/ConditionalAvailabilitySubjectSelect';
import { ConditionalAvailabilityValueInput } from '@/conditional-availability/components/ConditionalAvailabilityValueInput';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { isConditionalAvailabilityRowComplete } from '@/conditional-availability/utils/isConditionalAvailabilityRowComplete';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

type ConditionalAvailabilityRowFieldsProps = {
  row: ConditionalAvailabilityRow;
};

export const ConditionalAvailabilityRowFields = ({
  row,
}: ConditionalAvailabilityRowFieldsProps) => {
  const { t } = useLingui();

  return (
    <Field.Root render={<StyledFields />}>
      <ConditionalAvailabilitySubjectSelect row={row} />
      <ConditionalAvailabilityOperatorSelect row={row} />
      <ConditionalAvailabilityValueInput
        key={`${row.subject}-${row.operator}`}
        row={row}
      />
      {!isConditionalAvailabilityRowComplete({ row }) && (
        <Field.Description>{t`Select a value`}</Field.Description>
      )}
    </Field.Root>
  );
};
