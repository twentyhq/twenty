import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNumber, isString } from '@sniptt/guards';
import { Children, isValidElement } from 'react';
import { IconCopy } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContainer = styled.div`
  position: relative;

  .markdown-block-code {
    margin: 0;
  }
`;

const StyledCopyButtonContainer = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  opacity: 0;
  position: absolute;
  right: ${themeCssVariables.spacing[2]};
  top: ${themeCssVariables.spacing[2]};
  transition: opacity calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease;

  ${StyledContainer}:hover & {
    opacity: 1;
  }

  &:hover {
    background: ${themeCssVariables.background.primary};
  }
`;

const extractTextFromNode = (node: React.ReactNode): string => {
  if (isString(node) || isNumber(node)) {
    return node.toString();
  }

  if (Array.isArray(node)) {
    return node.map(extractTextFromNode).join('');
  }

  if (isValidElement<{ children?: React.ReactNode }>(node)) {
    return Children.toArray(node.props.children)
      .map(extractTextFromNode)
      .join('');
  }

  return '';
};

export const MarkdownCodeBlock = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  const codeText = extractTextFromNode(children);

  return (
    <StyledContainer className="markdown-code-outer-container">
      <StyledCopyButtonContainer>
        <LightIconButton
          Icon={IconCopy}
          onClick={() => copyToClipboard(codeText, t`Code copied to clipboard`)}
          title={t`Copy code`}
          size="small"
          accent="tertiary"
        />
      </StyledCopyButtonContainer>
      <pre className="markdown-block-code">{children}</pre>
    </StyledContainer>
  );
};
