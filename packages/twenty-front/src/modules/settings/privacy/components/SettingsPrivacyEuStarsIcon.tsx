const EU_STAR_POSITIONS = Array.from({ length: 12 }, (_, index) => {
  const angle = (index * Math.PI) / 6;

  return { cx: 12 + 5.5 * Math.sin(angle), cy: 8 - 5.5 * Math.cos(angle) };
});

export const SettingsPrivacyEuStarsIcon = () => (
  <svg width={24} height={16} viewBox="0 0 24 16" fill="currentColor">
    {EU_STAR_POSITIONS.map(({ cx, cy }) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1} />
    ))}
  </svg>
);
