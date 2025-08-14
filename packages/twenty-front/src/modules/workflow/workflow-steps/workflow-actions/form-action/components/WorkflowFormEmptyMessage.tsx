import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

const StyledMessageContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(4)};
  padding-inline: ${({ theme }) => theme.spacing(7)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledMessageContentContainer = styled.div`
  flex-direction: column;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
  padding: ${({ theme }) => theme.spacing(4)};
  line-height: normal;
`;

const StyledMessageTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: 13px;
`;

const StyledMessageDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const StyledFieldContainer = styled.div`
  align-items: center;
  background: transparent;
  border: none;
  display: flex;
  font-family: inherit;
  width: 100%;
`;

export const WorkflowFormEmptyMessage = () => {
  const { t } = useLingui();

  return (
    <StyledMessageContainer>
      <FormFieldInputContainer>
        <FormFieldInputRowContainer multiline maxHeight={124}>
          <FormFieldInputInnerContainer
            formFieldInputInstanceId="empty-form-message"
            hasRightElement={false}
          >
            <StyledFieldContainer>
              <StyledMessageContentContainer>
                <StyledMessageTitle data-testid="empty-form-message-title">
                  {t`Add inputs to your form`}
                </StyledMessageTitle>
                <StyledMessageDescription data-testid="empty-form-message-description">
                  {t`Click on "Add Field" below to add the first input to your form. The form will pop up on the user's screen when the workflow is launched from a manual trigger. For other types of triggers, it will be displayed in the Workflow run record page.`}
                </StyledMessageDescription>
              </StyledMessageContentContainer>
            </StyledFieldContainer>
          </FormFieldInputInnerContainer>
        </FormFieldInputRowContainer>
      </FormFieldInputContainer>
    </StyledMessageContainer>
  );
};
