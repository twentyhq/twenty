import { RECORD_TABLE_VERTICAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableVerticalScrollShadowVisibilityCssVariableName';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const VerticalScrollBoxShadowCSS = `
  &::before {
    bottom: -1px;
    box-shadow:
      0px 2px 4px 0px ${themeCssVariables.boxShadow.color},
      0px 0px 4px 0px ${themeCssVariables.boxShadow.color};
    clip-path: inset(0px 0px -4px 0px);
    content: '';
    height: 4px;
    position: absolute;
    visibility: var(
      ${RECORD_TABLE_VERTICAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME},
      hidden
    );
    width: 100%;
  }
`;
