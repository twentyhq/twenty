import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledWidgetMessage = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.md};
  line-height: ${() => themeCssVariables.text.lineHeight.md};
  padding: ${() => themeCssVariables.spacing[2]};
`;

type WidgetMessageProps = {
  message: string;
};

export const WidgetMessage = ({ message }: WidgetMessageProps) => (
  <StyledWidgetMessage>{message}</StyledWidgetMessage>
);
