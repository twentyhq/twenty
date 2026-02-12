import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { AUTO_SET_HEADER_KEYS } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/AutoSetHeaderKeys';
import { isAutoSetHeaderKey } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/isReadOnlyHeaderKey';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { css } from '@emotion/react';
import { t } from '@lingui/core/macro';
import styled from '@emotion/styled';
import { useState } from 'react';
import { IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { v4 } from 'uuid';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledKeyValueContainer = styled.div<{ readonly: boolean | undefined }>`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};

  ${({ readonly, theme }) =>
    readonly
      ? css`
          grid-template-columns: repeat(2, minmax(0, 1fr));
        `
      : css`
          grid-template-columns: repeat(2, minmax(0, 1fr)) ${theme.spacing(8)};
        `};
`;
export type KeyValuePair = {
  id: string;
  key: string;
  value: string;
  isAutoSet: boolean;
};

export type KeyValuePairInputProps = {
  label?: string;
  defaultValue?: Record<string, string> | Array<string>;
  onChange: (value: Record<string, string>) => void;
  readonly?: boolean;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
};

export const KeyValuePairInput = ({
  label,
  onChange,
  readonly,
  keyPlaceholder = t`Key`,
  valuePlaceholder = t`Value`,
  defaultValue,
}: KeyValuePairInputProps) => {
  const [pairs, setPairs] = useState<KeyValuePair[]>(() => {
    const initialPairs = defaultValue
      ? Object.entries(defaultValue).map(([key, value]) => ({
          id: v4(),
          key,
          value,
          isAutoSet: isAutoSetHeaderKey(key),
        }))
      : [];
    return initialPairs.length > 0
      ? [...initialPairs, { id: v4(), key: '', value: '', isAutoSet: false }]
      : [{ id: v4(), key: '', value: '', isAutoSet: false }];
  });

  const getKeyValidationError = (pair: KeyValuePair): string | undefined => {
    const trimmedKey = pair.key.trim();

    if (!pair.isAutoSet && isAutoSetHeaderKey(trimmedKey)) {
      return t`This key should be set through body input`;
    }

    return undefined;
  };

  const handlePairChange = (
    pairId: string,
    field: 'key' | 'value',
    newValue: string,
  ) => {
    const index = pairs.findIndex((p) => p.id === pairId);
    const newPairs = [...pairs];

    newPairs[index] = { ...newPairs[index], [field]: newValue };

    if (
      index === pairs.length - 1 &&
      (field === 'key' || field === 'value') &&
      Boolean(newValue.trim())
    ) {
      newPairs.push({ id: v4(), key: '', value: '', isAutoSet: false });
    }

    setPairs(newPairs);

    const record = newPairs.reduce(
      (acc, pair) => {
        if (!pair.isAutoSet && isAutoSetHeaderKey(pair.key)) {
          return acc;
        }
        if (pair.key.trim().length > 0) {
          acc[pair.key] = pair.value;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    onChange(record);
  };

  const handleRemovePair = (pairId: string) => {
    const newPairs = pairs.filter((pair) => pair.id !== pairId);
    if (
      newPairs.length === 0 ||
      (newPairs.length === AUTO_SET_HEADER_KEYS?.length &&
        newPairs.every((pair) =>
          AUTO_SET_HEADER_KEYS.includes(pair.key.trim()),
        ))
    ) {
      newPairs.push({ id: v4(), key: '', value: '', isAutoSet: false });
    }
    setPairs(newPairs);

    const record = newPairs.reduce(
      (acc, { key, value }) => {
        if (key.trim().length > 0) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    onChange(record);
  };

  return (
    <FormFieldInputContainer>
      {label && <InputLabel>{label}</InputLabel>}
      <StyledContainer>
        {pairs.map((pair) => (
          <StyledKeyValueContainer key={pair.id} readonly={readonly}>
            <FormTextFieldInput
              placeholder={keyPlaceholder}
              readonly={readonly || pair.isAutoSet}
              defaultValue={pair.key}
              onChange={(value) =>
                handlePairChange(pair.id, 'key', value ?? '')
              }
              VariablePicker={WorkflowVariablePicker}
              error={getKeyValidationError(pair)}
            />

            <FormTextFieldInput
              placeholder={valuePlaceholder}
              readonly={readonly || pair.isAutoSet}
              defaultValue={pair.value}
              onChange={(value) =>
                handlePairChange(pair.id, 'value', value ?? '')
              }
              VariablePicker={WorkflowVariablePicker}
            />

            {!readonly &&
              (pair.id !== pairs[pairs.length - 1].id && !pair.isAutoSet ? (
                <Button
                  onClick={() => handleRemovePair(pair.id)}
                  Icon={IconTrash}
                />
              ) : (
                <Button Icon={IconTrash} disabled={true} />
              ))}
          </StyledKeyValueContainer>
        ))}
      </StyledContainer>
    </FormFieldInputContainer>
  );
};
