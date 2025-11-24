import { Button } from "@/ui/components/button";
import { sendMessage } from "@/utils/messaging";

const Main = () => {

  const handleClick = async () => {
    await sendMessage('openPopup')
  };

  return <Button onClick={handleClick} data-id="twenty-btn">Add to Twenty</Button>;
};

export default Main;
