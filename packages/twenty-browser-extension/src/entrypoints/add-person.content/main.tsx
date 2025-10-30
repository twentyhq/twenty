import { Button } from "@/ui/components/button";

const Main = () => {

  const handleClick = async () => {
    await sendMessage('openPopup')
  };

  return <Button onClick={handleClick}>Add to Twenty</Button>;
};

export default Main;
