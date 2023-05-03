import React, { useState, useEffect } from 'react';
import { IconType } from 'react-icons/lib';

interface IconProps {
  icon: IconType;
}

const ReactIcon: React.FC<IconProps> = ({ icon }) => {
  const [IconComponent, setIconComponent] = useState<any>(null);

  useEffect(() => {
    const loadIcon = async () => {
      try {
        const ico = await import(`react-icons/fa/${icon}`);
        setIconComponent(() => ico.default);
      } catch (error) {
        console.error(`Failed to load icon: ${icon}`, error);
      }
    };

    loadIcon();
  }, [icon]);

  return <IconComponent />;
};

export default ReactIcon;
