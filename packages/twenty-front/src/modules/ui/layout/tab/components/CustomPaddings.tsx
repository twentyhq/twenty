import React from 'react';

interface CustomPaddingsProps {
  padding?: string | number;
  children: React.ReactNode;
}

export const CustomPaddings: React.FC<CustomPaddingsProps> = ({
  padding,
  children,
}) => {
  const paddingValue = typeof padding === 'number' ? `${padding}px` : padding;

  return (
    <div
      className={`custom-padding`}
      style={
        {
          '--custom-padding': paddingValue,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};
