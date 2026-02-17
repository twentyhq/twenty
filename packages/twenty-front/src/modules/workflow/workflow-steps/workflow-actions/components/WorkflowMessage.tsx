import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import styled from '@emotion/styled';

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

export const WorkflowMessage = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <StyledMessageContainer>
      <FormFieldInputContainer>
        <FormFieldInputRowContainer multiline maxHeight={145}>
          <FormFieldInputInnerContainer
            formFieldInputInstanceId="workflow-message"
            hasRightElement={false}
          >
            <StyledFieldContainer>
              <StyledMessageContentContainer>
                <StyledMessageTitle data-testid="workflow-message-title">
                  {title}
                </StyledMessageTitle>
                <StyledMessageDescription data-testid="workflow-message-description">
                  {description}
                </StyledMessageDescription>
              </StyledMessageContentContainer>
            </StyledFieldContainer>
          </FormFieldInputInnerContainer>
        </FormFieldInputRowContainer>
      </FormFieldInputContainer>
    </StyledMessageContainer>
  );
};
