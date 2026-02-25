export const VideoPlayer = ({ src, extension }: { src: string, extension: string }) => {
  return (
    <video controls style={{ width: '100%' }}>
      <source src={src} type={`video/${extension}`} />
    </video>
  );
};
