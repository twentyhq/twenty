
export const AudioPlayer = ({ src }: { src: string }) => {
  return (
    <audio controls>
      <source src={src} />
    </audio>
  );
};
