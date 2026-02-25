export const VideoPlayer = ({ src }: { src: string }) => {
  return (
    <video controls>
      <source src={src} />
    </video>
  );
};
