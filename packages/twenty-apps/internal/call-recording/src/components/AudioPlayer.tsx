export const AudioPlayer = ({ src, extension }: { src: string, extension: string }) => {
  return (
    <audio controls style={{ width: '100%' }}>
      <source src={src} type={`audio/${extension}`} />
    </audio>
  );
};
