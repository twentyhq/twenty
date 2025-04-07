import { Template } from '@/chat/call-center/types/WhatsappTemplate';
import styled from '@emotion/styled';
// eslint-disable-next-line no-restricted-imports
import { IconArrowForwardUp } from '@tabler/icons-react';
import { IconMessage } from 'twenty-ui/display';

type TemplateMessageProps = {
  templates: Template[] | undefined;
  onTemplateUpdate: (
    templateName: string,
    message: string,
    language: string,
  ) => void;
};

const StyledTemplate = styled.div`
  display: flex;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)};
  gap: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background-color: ${({ theme }) => theme.background.secondary};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledDiv = styled.div`
  width: 100%;
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
`;

const StyledTemplateName = styled.h2`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  font-size: ${({ theme }) => theme.font.size.md};
  margin: 0;
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  font-size: ${({ theme }) => theme.font.size.md};
  margin: ${({ theme }) => theme.spacing(3)} 0 0 0;
`;

const StyledBody = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: 150%;
  margin: ${({ theme }) => theme.spacing(3)} 0 0 0;
`;

const StyledFooter = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  font-size: ${({ theme }) => theme.font.size.md};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

// It will be necessary to refactor for a better way
export const TemplateMessage = ({
  templates,
  onTemplateUpdate,
}: TemplateMessageProps) => {
  if (!templates) {
    return <span>No templates available</span>;
  }

  const templateElements = templates.map((template) => {
    const headerComponent = template.components.find(
      (component) => component.type === 'HEADER',
    );
    const bodyComponent = template.components.find(
      (component) => component.type === 'BODY',
    );
    const footerComponent = template.components.find(
      (component) => component.type === 'FOOTER',
    );

    const message = [
      headerComponent?.text,
      bodyComponent?.text,
      footerComponent?.text,
    ]
      .filter(Boolean)
      .join('\n\n');

    return (
      <StyledTemplate
        key={template.id}
        onClick={() =>
          onTemplateUpdate(template.name, message, template.language)
        }
      >
        <IconMessage size={20} />
        <StyledDiv>
          <StyledHeader>
            <StyledTemplateName>{template.name}</StyledTemplateName>
            <IconArrowForwardUp size={14} />
          </StyledHeader>
          {headerComponent && <StyledTitle>{headerComponent.text}</StyledTitle>}
          {bodyComponent && <StyledBody>{bodyComponent.text}</StyledBody>}
          {footerComponent && (
            <StyledFooter>{footerComponent.text}</StyledFooter>
          )}
        </StyledDiv>
      </StyledTemplate>
    );
  });

  return <>{templateElements}</>;
};
