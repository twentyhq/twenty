import { Tag } from 'twenty-ui/components';

type SettingsAIAgentTypeTagProps = {
  isCustom: boolean;
  className?: string;
};

export const SettingsAIAgentTypeTag = ({
  className,
  isCustom,
}: SettingsAIAgentTypeTagProps) => {
  const getTagColor = (isCustom: boolean) => {
    return isCustom ? 'orange' : 'blue';
  };

  const getTagText = (isCustom: boolean) => {
    return isCustom ? 'Custom' : 'Standard';
  };

  return (
    <Tag
      className={className}
      color={getTagColor(isCustom)}
      text={getTagText(isCustom)}
      weight="medium"
    />
  );
};
