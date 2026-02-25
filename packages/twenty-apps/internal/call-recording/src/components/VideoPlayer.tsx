export const VideoPlayer = ({ src, extension }: { src: string, extension: string }) => {
  return (
    <video controls>
      <source src={src} type={`video/${extension}`} />
    </video>
  );
};
