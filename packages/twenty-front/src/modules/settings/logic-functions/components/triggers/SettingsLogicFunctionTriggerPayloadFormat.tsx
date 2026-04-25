import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { CodeEditor } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[4]};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledHint = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

// Read-only preview of the payload the function will receive when triggered.
// Updates as the trigger settings change so users can see how route, method,
// or event name affect the input shape.
export const SettingsLogicFunctionTriggerPayloadFormat = ({
  payload,
  hint,
}: {
  payload: object;
  hint?: string;
}) => {
  const { t } = useLingui();

  return (
    <StyledContainer>
      <StyledLabel>{t`Sample input`}</StyledLabel>
      <CodeEditor
        value={JSON.stringify(payload, null, 2)}
        language="json"
        height={140}
        options={{ readOnly: true }}
      />
      {hint !== undefined && <StyledHint>{hint}</StyledHint>}
    </StyledContainer>
  );
};
