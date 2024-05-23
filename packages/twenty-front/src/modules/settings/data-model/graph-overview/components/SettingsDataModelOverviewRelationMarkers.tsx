import { useTheme } from '@emotion/react';

export const SettingsDataModelOverviewRelationMarkers = () => {
  const theme = useTheme();
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0 }}>
      <defs>
        <marker
          id="marker"
          viewBox="0 0 6 6"
          markerHeight="6"
          markerWidth="6"
          refX="3"
          refY="3"
          fill="none"
        >
          <circle cx="3" cy="3" r="3" fill={theme.color.gray} />
        </marker>
      </defs>
    </svg>
  );
};
