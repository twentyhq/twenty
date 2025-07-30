import { Tag } from 'twenty-ui/components';

type SettingsAIAgentTypeTagProps = {
  type: 'Standard' | 'Custom';
  className?: string;
};

export const SettingsAIAgentTypeTag = ({
  className,
  type,
}: SettingsAIAgentTypeTagProps) => {
  const getTagColor = (type: 'Standard' | 'Custom') => {
    switch (type) {
      case 'Standard':
        return 'blue';
      case 'Custom':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <Tag
      className={className}
      color={getTagColor(type)}
      text={type}
      weight="medium"
    />
  );
};