import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type SetuUpdateRecordFieldsActionPayload } from 'twenty-shared/ai';
import { IconArrowRight } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { formatAiActionFieldValue } from '@/ai/utils/formatAiActionFieldValue';

const StyledRecord = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-bottom: ${themeCssVariables.spacing[2]};
  overflow-wrap: anywhere;
`;

const StyledTableContainer = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  font-size: ${themeCssVariables.font.size.md};
  width: 100%;

  th {
    color: ${themeCssVariables.font.color.tertiary};
    font-size: ${themeCssVariables.font.size.sm};
    font-weight: ${themeCssVariables.font.weight.regular};
    padding: ${themeCssVariables.spacing[1]};
    text-align: left;
  }

  td {
    border-top: 1px solid ${themeCssVariables.border.color.light};
    color: ${themeCssVariables.font.color.primary};
    padding: ${themeCssVariables.spacing[1]};
    vertical-align: top;
  }
`;

const StyledBefore = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  text-decoration: line-through;
`;

const StyledArrowCell = styled.td`
  color: ${themeCssVariables.font.color.light};
  width: 16px;
`;

const StyledValueInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  outline: none;
  padding: 0;
  width: 100%;
`;

type AiActionRecordChangesPreviewProps = {
  payload: SetuUpdateRecordFieldsActionPayload;
  draftValues: Record<string, string> | null;
  isDisabled: boolean;
  onDraftValueChange: (fieldName: string, value: string) => void;
};

// Only the fields the action changes are listed, with the value the
// reviewer saw before; nothing hidden is inferred from the record.
export const AiActionRecordChangesPreview = ({
  payload,
  draftValues,
  isDisabled,
  onDraftValueChange,
}: AiActionRecordChangesPreviewProps) => {
  const { t } = useLingui();

  return (
    <div>
      <StyledRecord>{`${payload.objectLabel} · ${payload.recordLabel}`}</StyledRecord>
      <StyledTableContainer>
        <StyledTable>
          <thead>
            <tr>
              <th scope="col">{t`Field`}</th>
              <th scope="col">{t`Current`}</th>
              <th scope="col" aria-hidden />
              <th scope="col">{t`Proposed`}</th>
            </tr>
          </thead>
          <tbody>
            {payload.changes.map((change) => (
              <tr key={change.fieldName}>
                <td>{change.fieldLabel}</td>
                <td>
                  <StyledBefore>
                    {formatAiActionFieldValue(change.before)}
                  </StyledBefore>
                </td>
                <StyledArrowCell aria-hidden>
                  <IconArrowRight size={14} />
                </StyledArrowCell>
                <td>
                  {draftValues !== null ? (
                    <StyledValueInput
                      aria-label={t`Proposed ${change.fieldLabel}`}
                      value={draftValues[change.fieldName] ?? ''}
                      disabled={isDisabled}
                      onChange={(event) =>
                        onDraftValueChange(change.fieldName, event.target.value)
                      }
                    />
                  ) : (
                    formatAiActionFieldValue(change.after)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </StyledTableContainer>
    </div>
  );
};
