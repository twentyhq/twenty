import { ThemeColor } from "@/ui/theme/constants/colors";

export type SelectableOption = {
  color: ThemeColor;
  id: string;
  label: string;
  position: number;
  value: string;
  isSelected: boolean;
};
