export const CardDisplay = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
};
