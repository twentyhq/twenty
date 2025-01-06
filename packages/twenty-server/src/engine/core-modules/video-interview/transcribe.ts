import OpenAI from "openai";
// import openai from "openai";
import { IncomingForm } from "formidable";
const fs = require("fs");

export const config = {
  api: {
    bodyParser: false,
  },
};


export default async function handler(req: any, res: any) {
  console.log("Using api key :, process.env.OPENAI_API_KEY), process.env.OPENAI_API_KEY" , process.env.OPENAI_API_KEY)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // As we compressed the file and are limiting recordings to 2.5 minutes, we won't run into trouble with storage capacity
  const fData = await new Promise<{ fields: any; files: any }>(
    (resolve, reject) => {
      const form = new IncomingForm({
        multiples: false,
        uploadDir: "/tmp",
        keepExtensions: true,
      });
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    }
  );

  const videoFile = fData.files.file;
  const videoFilePath = videoFile?.filepath;
  console.log(videoFilePath);

  try {
    const resp = await openai.audio.transcriptions.create(
      { model: "whisper-1", file: fs.createReadStream(videoFilePath) }
    );

    const transcript = resp?.text;

    // Content moderation check
    const response = await openai.moderations.create({
      input: resp?.text,
    });

    if (response?.results[0]?.flagged) {
      res
        .status(200)
        .json({ error: "Inappropriate content detected. Please try again." });
      return;
    }

    res.status(200).json({ transcript });
    return resp;
  } catch (error) {
    console.error("server error", error);
    res.status(500).json({ error: "Error" });
  }
}
