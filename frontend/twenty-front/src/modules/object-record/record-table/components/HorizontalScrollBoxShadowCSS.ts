import { RECORD_TABLE_HORIZONTAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableHorizontalScrollShadowVisibilityCssVariableName';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const HorizontalScrollBoxShadowCSS = `
  &::after {
    content: '';
    position: absolute;
    top: -1px;
    height: calc(100% + 2px);
    width: 4px;
    right: -1px;
    box-shadow:
      2px 0px 4px 0px ${themeCssVariables.boxShadow.color},
      0px 0px 4px 0px ${themeCssVariables.boxShadow.color};
    clip-path: inset(0px -4px 0px 0px);
    visibility: var(
      ${RECORD_TABLE_HORIZONTAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME},
      hidden
    );
  }
`;
