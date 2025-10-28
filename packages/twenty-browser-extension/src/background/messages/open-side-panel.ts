import type { PlasmoMessaging } from "@plasmohq/messaging";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const tabId = req?.tabId ?? req.sender?.tab?.id;

  if(tabId){
    await chrome.sidePanel.open({
      tabId
    });
  }

  res.send({ success: true });
};

export default handler;
