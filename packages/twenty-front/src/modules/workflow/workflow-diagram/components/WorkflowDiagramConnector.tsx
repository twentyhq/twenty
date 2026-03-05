import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
export const WorkflowDiagramConnector = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="2"
      height="56"
      viewBox="0 0 2 56"
      fill="none"
    >
      <path
        d="M1 0V28V56"
        stroke={resolveThemeVariable(themeCssVariables.border.color.strong)}
        strokeDasharray="3 3"
      />
    </svg>
  );
};
