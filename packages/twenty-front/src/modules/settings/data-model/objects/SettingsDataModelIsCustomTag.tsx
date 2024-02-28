import { Tag } from '@/ui/display/tag/components/Tag';

type SettingsDataModelIsCustomTagProps = {
  className?: string;
  isCustom?: boolean;
};

export const SettingsDataModelIsCustomTag = ({
  className,
  isCustom,
}: SettingsDataModelIsCustomTagProps) => (
  <Tag
    className={className}
    color={isCustom ? 'orange' : 'blue'}
    text={isCustom ? 'Custom' : 'Standard'}
    weight="medium"
  />
);
