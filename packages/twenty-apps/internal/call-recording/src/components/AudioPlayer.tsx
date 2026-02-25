export const AudioPlayer = ({ src, extension }: { src: string, extension: string }) => {
  return (
    <audio controls>
      <source src={src} type={`audio/${extension}`} />
    </audio>
  );
};
