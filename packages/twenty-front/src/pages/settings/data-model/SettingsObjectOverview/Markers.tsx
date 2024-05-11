import { useTheme } from '@emotion/react';

export const Markers = () => {
  const theme = useTheme();
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0 }}>
      <defs>
        <marker
          id="hasOne"
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
      <defs>
        <marker
          id="hasMany"
          viewBox="0 0 6 6"
          markerHeight="6"
          markerWidth="6"
          refX="3"
          refY="3"
          fill="none"
        >
          <circle cx="3" cy="3" r="3" fill={theme.color.blue} />
        </marker>
      </defs>
      <defs>
        <marker
          id="hasMany-right"
          viewBox="0 0 24 40"
          markerWidth="24"
          markerHeight="40"
          refX="3"
          refY="20"
          fill="none"
        >
          <circle cx="3" cy="3" r="3" fill={theme.color.gray} />
          <circle cx="3" cy="20" r="3" fill={theme.color.gray} />
          <circle cx="3" cy="37" r="3" fill={theme.color.gray} />
          <path
            d="M16.6,2.1c4,0.6,7.4,3.4,7.4,7.7v20.5c0,4.2-3.4,7.7-7.6,7.7v-1.7c3.2,0,5.9-2.7,5.9-6V9.8c0-3.3-2.6-6-5.9-6
            V2.1H16.6z M3,37V2.9V37z M3,2.1h13.4c4.2,0,7.6,3.4,7.6,7.7h-1.7c0-3.3-2.6-6-5.9-6H3V2.1z M24,30.2c0,4.2-3.4,7.7-7.6,7.7H3v-1.7
            h13.4c3.2,0,5.9-2.7,5.9-6H24z"
            fill={theme.color.gray}
          />
        </marker>
      </defs>
    </svg>
  );
};
