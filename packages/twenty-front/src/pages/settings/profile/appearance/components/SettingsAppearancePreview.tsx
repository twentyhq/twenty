import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import {
  GRAY_SCALE_DARK,
  GRAY_SCALE_LIGHT,
  themeCssVariables,
} from 'twenty-ui/theme';
import { SALESFARCE_APPEARANCE_VALUE } from '@/salesfarce/constants/SalesfarceAppearanceValue';
import { SALESFARCE_PREVIEW_COLORS } from '@/salesfarce/constants/SalesfarcePreviewColors';
import { doNotTranslate } from 'twenty-shared/i18n';
import { type SettingsAppearanceValue } from '~/pages/settings/profile/appearance/types/SettingsAppearanceValue';

const StyledPreview = styled.div`
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  height: 80px;
  overflow: hidden;
  width: 100%;
`;

const StyledSegment = styled.div`
  align-items: flex-end;
  background: var(--appearance-preview-background);
  border: 1px solid var(--appearance-preview-border);
  box-sizing: border-box;
  display: flex;
  flex: 1;
  min-width: 0;
  padding-inline-start: ${themeCssVariables.spacing[6]};
  padding-top: ${themeCssVariables.spacing[6]};

  &:first-child {
    border-end-start-radius: ${themeCssVariables.border.radius.md};
    border-start-start-radius: ${themeCssVariables.border.radius.md};
  }

  &:last-child {
    border-end-end-radius: ${themeCssVariables.border.radius.md};
    border-start-end-radius: ${themeCssVariables.border.radius.md};
  }
`;

const StyledContent = styled.div`
  background: var(--appearance-preview-content-background);
  border-inline-start: 1px solid var(--appearance-preview-border);
  border-start-start-radius: ${themeCssVariables.border.radius.md};
  border-top: 1px solid var(--appearance-preview-border);
  box-sizing: border-box;
  color: var(--appearance-preview-content-color);
  flex: 1;
  font-size: 20px;
  height: 56px;
  padding-inline-start: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
  transition:
    height 0.1s ease-in-out,
    font-size 0.1s ease-in-out;

  @media (hover: hover) {
    [role='radio']:not([data-disabled]):hover > ${StyledPreview} & {
      font-size: 22px;
      height: 61px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

type SettingsAppearancePreviewProps = {
  appearance: SettingsAppearanceValue;
};

export const SettingsAppearancePreview = ({
  appearance,
}: SettingsAppearancePreviewProps) => {
  const segments = doNotTranslate(
    appearance === 'System' ? ['Light', 'Dark'] : [appearance],
  );

  return (
    <StyledPreview aria-hidden>
      {segments.map((segment) => {
        const grayScale =
          segment === 'Dark' ? GRAY_SCALE_DARK : GRAY_SCALE_LIGHT;
        const previewColors =
          segment === SALESFARCE_APPEARANCE_VALUE
            ? SALESFARCE_PREVIEW_COLORS
            : {
                background: grayScale.gray4,
                border: grayScale.gray5,
                contentBackground: grayScale.gray1,
                contentColor: grayScale.gray12,
              };

        return (
          <StyledSegment
            key={segment}
            style={
              {
                '--appearance-preview-background': previewColors.background,
                '--appearance-preview-border': previewColors.border,
                '--appearance-preview-content-background':
                  previewColors.contentBackground,
                '--appearance-preview-content-color':
                  previewColors.contentColor,
              } as CSSProperties
            }
          >
            <StyledContent>Aa</StyledContent>
          </StyledSegment>
        );
      })}
    </StyledPreview>
  );
};
