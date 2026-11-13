import { type IconComponent } from 'twenty-ui/icon';
import { type ThemeColor, themeCssVariables } from 'twenty-ui/theme';

const colorDotIconByColor = new Map<ThemeColor, IconComponent>();

// TabList renders a tab's Icon without props at icon size, so each color needs its own stable component drawn inside a 16px box
export const getRecordIndexTabColorDotIcon = (
  color: ThemeColor,
): IconComponent => {
  const cachedIcon = colorDotIconByColor.get(color);

  if (cachedIcon !== undefined) {
    return cachedIcon;
  }

  const ColorDotIcon: IconComponent = () => (
    <svg aria-hidden viewBox="0 0 16 16">
      <circle cx={8} cy={8} r={3.5} fill={themeCssVariables.tag.text[color]} />
    </svg>
  );

  colorDotIconByColor.set(color, ColorDotIcon);

  return ColorDotIcon;
};
