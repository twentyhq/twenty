import styled from '@emotion/styled';
import { Callout, type CalloutVariant } from 'twenty-ui/feedback';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFullWidthCallout = styled.div`
  width: 100%;

  > div {
    max-width: 100%;
  }
`;

const StyledAlertGlyph = styled.span`
  align-items: center;
  border: 1.5px solid currentColor;
  border-radius: 50%;
  box-sizing: border-box;
  display: flex;
  font-family: ${() => themeCssVariables.font.family};
  font-size: 10px;
  font-weight: 600;
  height: 16px;
  justify-content: center;
  line-height: 1;
  width: 16px;
`;

const AlertGlyphIcon = () => <StyledAlertGlyph>!</StyledAlertGlyph>;

type SlackSettingsCalloutProps = {
  variant: CalloutVariant;
  title: string;
  description: string;
};

export const SlackSettingsCallout = ({
  variant,
  title,
  description,
}: SlackSettingsCalloutProps) => (
  <StyledFullWidthCallout>
    <Callout
      variant={variant}
      title={title}
      description={description}
      Icon={AlertGlyphIcon}
    />
  </StyledFullWidthCallout>
);
